import { MutableRefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Address } from "../scaffold-eth";
import { io } from "socket.io-client";
import { useAccount } from "wagmi";
// Assets
import person from "~~/assets/person.svg";
import send from "~~/assets/send.svg";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Channel, Message } from "~~/types/bgcord";

// Socket
const socket = io("ws://localhost:6001");

const Messages = ({ messages, currentChannel }: { messages: Message[]; currentChannel: Channel | null }) => {
  const [message, setMessage] = useState("");
  const { address } = useAccount();

  const { data: hasJoinedChannel } = useScaffoldContractRead({
    contractName: "Bgcord",
    functionName: "hasJoined",
    args: [currentChannel?.id, address],
  });

  const { writeAsync: joinChannel } = useScaffoldContractWrite({
    contractName: "Bgcord",
    functionName: "mint",
    args: [currentChannel?.id],
  });

  const messageEndRef: MutableRefObject<null> = useRef(null);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const messageObj = {
      channel: currentChannel?.id.toString() as string,
      account: address as string,
      text: message,
    };

    if (message !== "") {
      socket.emit("new message", messageObj);
    }

    setMessage("");
  };

  const scrollHandler = () => {
    setTimeout(() => {
      if (messageEndRef.current) {
        (messageEndRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  useEffect(() => {
    scrollHandler();
  });

  return (
    <div className="bg-base-100 w-full flex flex-col items-center gap-3">
      <div className="overflow-auto h-[90%] w-full flex">
        <div className="overflow-y-scroll w-full pt-3 flex flex-col">
          <div className="h-fit mt-auto">
            {currentChannel &&
              hasJoinedChannel &&
              messages
                .filter(message => message.channel === currentChannel.id.toString())
                .map((message, index) => (
                  <div
                    className="flex gap-4 items-center bg-base-200 p-2 rounded-md cursor-pointer w-[95%] mx-auto my-2"
                    key={index}
                  >
                    <Image src={person} alt="Person" className=" w-10 p-2 bg-base-100 rounded-2xl" />
                    <div className="flex flex-col gap-2">
                      <Address address={message.account} size="xs" hideIcons={true} />
                      <h3 className="ml-1.5 text-xs">{message.text}</h3>
                    </div>
                  </div>
                ))}
          </div>
          {currentChannel && !hasJoinedChannel && (
            <div className="w-full h-full flex justify-center items-center">
              <button className="btn " onClick={() => joinChannel()}>
                Join {currentChannel.name} channel
              </button>
            </div>
          )}
          {!currentChannel && (
            <div className="w-full h-full text-7xl flex justify-center items-center italic font-bold opacity-20">
              Join a channel
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div className="h-[10%] w-[90%]">
        <form onSubmit={sendMessage} className="flex p-2 bg-base-200">
          {currentChannel && address ? (
            <input
              type="text"
              value={message}
              placeholder={`Message #${currentChannel.name}`}
              onChange={e => setMessage(e.target.value)}
              className="focus:bg-transparent focus:border-transparent  focus:text-gray-400 bg-transparent w-full p-2"
            />
          ) : (
            <input
              type="text"
              value=""
              placeholder={`Please Connect Wallet / Join a Channel`}
              disabled
              className="focus:bg-transparent focus:text-gray-400 bg-transparent p-2 w-full"
            />
          )}

          <button type="submit">
            <Image className="w-6 m-2" src={send} alt="Send Message" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
