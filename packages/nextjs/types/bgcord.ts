import { Dispatch, SetStateAction } from "react";

export type Channel = {
  id: bigint;
  name: string;
};

export type SetCurrentChannel = Dispatch<SetStateAction<Channel | null>>;

export type Message = {
  channel: string;
  account: string;
  text: string;
};
