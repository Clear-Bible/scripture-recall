import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import { VoiceChat } from "@/components/VoiceChat";

const Chat = () => {
  // const accessToken = await getHumeAccessToken();

  // if (!accessToken) {
  //   throw new Error();
  // }

  return (
    <div className={"grow flex flex-col"}>
      <VoiceChat />
    </div>
  );
};

export default Chat;
