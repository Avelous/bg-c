"use client";

import { useEffect, useState } from "react";
import Ably from "ably";
import type { NextPage } from "next";
import Channels from "~~/components/Bgcord/Channels";
import Messages from "~~/components/Bgcord/Messages";
import useGetChannels from "~~/hooks/useGetChannels";
import { Channel } from "~~/types/bgcord";

const Home: NextPage = () => {
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;

  const { channels } = useGetChannels();
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!ablyApiKey) return;
    const ably = new Ably.Realtime({ key: ablyApiKey });
    const channel = ably.channels.get("messages");

    channel.publish("getMessages", "getMessages");

    channel.subscribe("messages", messages => {
      setMessages(messages.data);
    });

    return () => {
      channel.unsubscribe("messages");
      channel.unsubscribe("newMessage");
    };
  }, [ablyApiKey]);

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
