"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { io } from "socket.io-client";
import Channels from "~~/components/Bgcord/Channels";
import Messages from "~~/components/Bgcord/Messages";
import useGetChannels from "~~/hooks/useGetChannels";
import { Channel } from "~~/types/bgcord";

const Home: NextPage = () => {
  const serverUrl = "";

  const { channels } = useGetChannels();
  const socket = io("ws://localhost:6001");
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("get messages");
    });

    socket.on("new message", messages => {
      setMessages(messages);
    });

    socket.on("get messages", messages => {
      setMessages(messages);
    });

    return () => {
      socket.off("connect");
      socket.off("new message");
      socket.off("get messages");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex items-center flex-col h-full w-full">
        <div className="w-full h-full">
          <main className="h-full">
            <div className="flex h-full">
              <Channels channels={channels} currentChannel={currentChannel} setCurrentChannel={setCurrentChannel} />
              <Messages messages={messages} currentChannel={currentChannel} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
