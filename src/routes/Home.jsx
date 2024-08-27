import { LampDesk } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const Home = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between w-full">
        <div className="font-bold text-xl mb-6">Lamp.Bible</div>
        <LampDesk strokeWidth={2} stroke={"currentColor"} />
      </div>
      <blockquote className="text-center italic">
        Your word is a lamp for my feet
      </blockquote>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Your Progress</CardTitle>
          <CardDescription>You're doing great!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs">Passages you know well</p>
          <Progress value={40} className="" />
          <p className="my-4 text-xs">Passages you kind of know</p>
          <Progress value={70} className="" />
          <p className="my-4 text-xs">Passages you don't know yet</p>
          <Progress value={20} className="" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
