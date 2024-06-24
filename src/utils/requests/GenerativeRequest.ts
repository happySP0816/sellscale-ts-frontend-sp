import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '../../components/App';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';

interface GenerativeRequestProps {
  endpoint: string;
}

/**
 * Custom hook to handle generative requests.
 * 
 * @param {GenerativeRequestProps} param0 - The endpoint for the generative request.
 * @returns {Object} - Contains data, setData, loading, setLoading, and triggerGenerativeRequest.
 * 
 * @example
 * const { data, loading, triggerGenerativeRequest } = useGenerativeRequest({ endpoint: '/api/endpoint' });
 * 
 * @author Hunter Gordon
 */
export default function useGenerativeRequest({ endpoint }: GenerativeRequestProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomID, setRoomID] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    const handleData = (incomingData: any) => {
      if (incomingData.message === "done" && incomingData.room_id === roomID) {
        socket.off("stream-answers", handleData);
        setLoading(false);
        return;
      }
      if (incomingData.room_id === roomID) {
        setData(prevData => [...prevData, incomingData]);
      }
    };

    socket.on("stream-answers", handleData);

    return () => {
      socket.off("stream-answers", handleData);
    };
  }, [roomID]);

  const triggerGenerativeRequest = useCallback(async (requestBody: Record<string, any>) => {
    if (loading) {
      console.warn('A request is already in progress.');
      return;
    }

    setData([]);
    setLoading(true);

    try {
      const room_id = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
      setRoomID(room_id);
      console.log('room id set to', room_id);
      socket.emit("join-room", {
        payload: { room_id: room_id },
      });

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          ...requestBody,
          room_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      setLoading(false);
    }
  }, [endpoint, userToken, loading]);

  return { data, setData, loading, setLoading, triggerGenerativeRequest };
}
