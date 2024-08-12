import { useState, useRef, useEffect } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import {
  Card,
  HoverCard,
  Text,
  Button,
  Paper,
  Flex,
  Loader,
  ActionIcon,
} from "@mantine/core";
import {
  IconCircleDot,
  IconFileText,
  IconMicrophone,
  IconMicrophone2,
  IconMicrophone2Off,
} from "@tabler/icons";
import { IconCircleDotFilled, IconCircleFilled } from "@tabler/icons-react";
import { on } from "events";
import { showNotification } from "@mantine/notifications";

type DeepGramProps = {
  onTranscriptionChanged: (text: string) => void;
};

export default function DeepGram({ onTranscriptionChanged }: DeepGramProps) {
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [lastText, setLastText] = useState("");
  const deepgram = createClient("e9d9d07aa3dcd0d87ea82dbe5f91c9759f2b2319");
  const liveRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const requestMicrophoneAccess = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted.");
      } catch (error) {
        console.error("Error accessing media devices.", error);
        // alert("Permission denied. Please allow access to the microphone.");
        showNotification({
          color: "red",
          title: "Error accessing media devices",
          message: "Permission denied. Please allow access to the microphone.",
        });
      }
    };

    requestMicrophoneAccess();
  }, []);

  useEffect(() => {
    onTranscriptionChanged(transcribedText);
  }, [transcribedText]);

  const initializeLive = () => {
    const live = deepgram.listen.live({ model: "enhanced-general" });
    liveRef.current = live;

    live.on(LiveTranscriptionEvents.Open, () => {
      console.log("Connection to Deepgram opened.");
    });

    live.on(LiveTranscriptionEvents.Transcript, (data) => {
      setLastText(data.channel.alternatives[0].transcript);
      if (lastText !== data.channel.alternatives[0].transcript) {
        setTranscribedText(
          (prevText) => prevText + " " + data.channel.alternatives[0].transcript
        );
      }
      console.log(data.channel.alternatives[0].transcript);
    });

    live.on(LiveTranscriptionEvents.Close, (event) => {
      console.log("Connection to Deepgram closed:", event);
    });

    live.on(LiveTranscriptionEvents.Error, (error) => {
      console.error("Error occurred:", error);
    });
  };

  const handleToggleRecording = async () => {
    if (recording) {
      // alert("Recording stopped");
      setRecording(false);
      setSpeaking(false);
      setTranscribing(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (liveRef.current) {
        liveRef.current.finish();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // alert("Recording started");
        setTranscribedText("");
        setLastText("");
        onTranscriptionChanged("");
        setRecording(true);
        setSpeaking(true);
        setTranscribing(true);
        initializeLive();

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && liveRef.current) {
            liveRef.current.send(event.data);
          }
        };

        mediaRecorder.start(1000); // Collect audio data in chunks of 1 second
      } catch (error) {
        console.error("Error accessing media devices.", error);
        // alert("Permission denied. Please allow access to the microphone.");
        showNotification({
          color: "red",
          title: "Error accessing media devices",
          message: "Permission denied. Please allow access to the microphone.",
        });
      }
    }
  };

  return (
    <div>
      <HoverCard width={280} shadow="md" withinPortal>
        <HoverCard.Target>
          <ActionIcon
            variant="filled"
            onClick={handleToggleRecording}
            size="md"
            mr="xs"
            className="bg-[#E25DEE] hover:bg-[#E25DEE]/80"
          >
            {recording ? (
              // <IconCircleFilled size={16} />
              <Loader variant="bars" color="grape" size="xs" />
            ) : (
              // <IconCircleDot size={16} />
              <IconMicrophone size={"1rem"} />
            )}
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Paper>
            <Text>Transcribed Text: {transcribedText}</Text>
            <Card withBorder mt="sm">
              <Text fw="bold">Sample Questions</Text>
              <Text fz="xs">
                1. Can you describe your project?
                <br />
                2. What challenges are you facing?
                <br />
                3. What are your goals?
              </Text>
            </Card>
          </Paper>
        </HoverCard.Dropdown>
      </HoverCard>
    </div>
  );
}
