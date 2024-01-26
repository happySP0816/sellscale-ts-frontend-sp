import { socket } from '../../components/App';

/**
 * A socket event that is a chat completion stream.
 * @param event - The socket event to listen to.
 * @param callback - The callback function to run when the event is triggered.
 * - @param total - The total completion so far.
 * - @param delta - The latest chunk of completion.
 * - @param data - Extra data that is sent with the event from the backend.
 */
export function completionStream(
  event: string,
  callback: (total: string, delta: string, data?: Record<string, any>) => void
) {
  let total = '';
  socket.on(event, (data) => {
    const delta = data.response_delta;
    total += delta;
    callback(total, delta, data.extra_data);
  });
}
