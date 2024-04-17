"use client";

import { useEffect, useState } from "react";
import Ably from "ably";
import type { NextPage } from "next";
import Channels from "~~/components/Bgcord/Channels";
import Messages from "~~/components/Bgcord/Messages";
import useGetChannels from "~~/hooks/useGetChannels";
import serverConfig from "~~/server.config";
import { Channel } from "~~/types/bgcord";

const Home: NextPage = () => {
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  const serverUrl = serverConfig.isLocal ? serverConfig.localUrl : serverConfig.liveUrl;

  const { channels } = useGetChannels();
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  const getMessages = async () => {
    await fetch(`${serverUrl}/user/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer`,
        "Content-Type": "application/json",
      },
    });
  };

  useEffect(() => {
    if (!ablyApiKey) return;

    const fetchMessages = async () => {
      try {
        await getMessages();
      } catch (error) {}
    };

    const ably = new Ably.Realtime({ key: ablyApiKey });
    const channel = ably.channels.get("messages");

    channel
      .subscribe("messages", messages => {
        setMessages(messages.data);
      })
      .then(() => {
        fetchMessages();
      });

    return () => {
      channel.unsubscribe("messages");
      channel.unsubscribe("newMessage");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
