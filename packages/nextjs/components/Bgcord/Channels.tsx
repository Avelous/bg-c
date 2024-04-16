import { Channel, SetCurrentChannel } from "~~/types/bgcord";

const Channels = ({
  channels,
  currentChannel,
  setCurrentChannel,
}: {
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: SetCurrentChannel;
}) => {
  return (
    <div className="h-full w-[25%] md:w-[15%]">
      <div className="p-4 flex items-center flex-col w-full">
        <h2 className="text-lg font-semibold mb-4 w-full">Channels</h2>
        <ul className="menu text-base-content w-full">
          {channels.map((channel, index) => (
            <li
              onClick={() => setCurrentChannel(channel)}
              key={index}
              className={
                currentChannel && currentChannel.id.toString() === channel.id.toString()
                  ? "bg-gray-700 rounded-full"
                  : ""
              }
            >
              <a>{channel.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Channels;
