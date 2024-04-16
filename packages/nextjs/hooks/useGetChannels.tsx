import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Channel } from "~~/types/bgcord";

const useGetChannels = () => {
  const { data: deployedContract } = useDeployedContractInfo("Bgcord");
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    (async () => {
      const fetchedChannels = [];
      if (deployedContract) {
        try {
          const data = await readContract({
            address: deployedContract?.address,
            abi: deployedContract?.abi,
            functionName: "totalChannels",
          });

          const totalChannels = parseInt(data.toString());

          for (let i = 1; i <= totalChannels; i++) {
            const channel = await readContract({
              address: deployedContract.address,
              abi: deployedContract.abi,
              functionName: "getChannel",
              args: [BigInt(i)],
            });
            fetchedChannels.push(channel);
          }
          setChannels(fetchedChannels);
        } catch (error) {}
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployedContract]);

  return { channels };
};

export default useGetChannels;
