import { useState } from "react";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import { useNetwork } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { Channel, SetCurrentChannel } from "~~/types/bgcord";
import { getParsedError } from "~~/utils/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const useChannelHandler = ({ setCurrentChannel }: { setCurrentChannel: SetCurrentChannel }) => {
  const { data: deployedContract } = useDeployedContractInfo("Bgcord");
  const { address } = useAccount();
  const { chain } = useNetwork();
  const configuredNetwork = scaffoldConfig.targetNetworks[0];
  const [isMining, setIsMining] = useState(false);
  const writeTx = useTransactor();

  const sendContractWriteTx = async (channel: Channel) => {
    if (!chain?.id) {
      notification.error("Please connect your wallet");
      return;
    }
    if (chain?.id !== configuredNetwork.id) {
      notification.error("You on the wrong network");
      return;
    }

    if (deployedContract) {
      const config = await prepareWriteContract({
        address: deployedContract.address,
        abi: deployedContract.abi,
        functionName: "mint",
        args: [channel.id],
      });

      try {
        setIsMining(true);
        await writeTx(() => writeContract(config));
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      } finally {
        setIsMining(false);
      }
    } else {
      notification.error("Contract writer error. Try again.");
      return;
    }
  };

  const channelHandler = async (channel: Channel) => {
    if (deployedContract && address) {
      setCurrentChannel(channel);
    }
  };

  return { channelHandler, mintAsync: sendContractWriteTx, isMining };
};

export default useChannelHandler;
