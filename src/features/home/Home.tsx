import { BfLogotype, BfLogomark, Text } from "@/components";

export const HomePage = () => {
  return (
    <div className="p-2">
      <Text.Heading>Welcome!</Text.Heading>
      <Text.Body>Bonfire home!</Text.Body>
      <BfLogotype />
      <BfLogomark />
    </div>
  );
};
