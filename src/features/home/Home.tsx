import { LoaderCircle } from "lucide-react";
import { Button, BfLogotype, BfLogomark, Text } from "@/components";
import { ZodiacAquarius } from "lucide-react";

export const HomePage = () => {
  return (
    <div className="p-2">
      <Text.Heading>Welcome!</Text.Heading>
      <Text.Body>Bonfire home!</Text.Body>
      {/* <BfLogotype /> */}
      <BfLogomark />
      <Button
        size={{ base: "xs", sm: "xl" }}
        display={{ sm: "block" }}
      >
        {/* <ZodiacAquarius /> */}
        Click Here
      </Button>
    </div>
  );
};
