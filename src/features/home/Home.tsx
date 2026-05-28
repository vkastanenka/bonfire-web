import { LoaderCircle, ZodiacAquarius } from "lucide-react";
import { Button, BfLogotype, BfLogomark, Text } from "@/components";

export const HomePage = () => {
  return (
    <div className="p-2">
      <Text.Heading>Welcome!</Text.Heading>
      <Button color="primary" shape="circle">
        <ZodiacAquarius />
      </Button>
      <Button>Base</Button>
      <Button.Soft>Soft</Button.Soft>
      <Button.Outline disabled>Outline</Button.Outline>
      <Button.Dash>Dash</Button.Dash>
      <Button.Active>Active</Button.Active>
      <Button.Ghost>Ghost</Button.Ghost>
      <Button.Link>Link</Button.Link>
    </div>
  );
};
