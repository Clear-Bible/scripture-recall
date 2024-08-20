import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ModeToggle from "@/components/ModeToggle";

const Settings = () => {
  return (
    <>
      <h1 className="font-bold text-lg mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Appearance</CardTitle>
          <CardDescription>Customize look and feel.</CardDescription>
        </CardHeader>
        <CardContent>
          <ModeToggle />
        </CardContent>
      </Card>
    </>
  );
};

export default Settings;
