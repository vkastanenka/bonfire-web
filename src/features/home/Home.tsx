import { Button, BfLogotype, Text, TextInput } from "@/components";

export const HomePage = () => {
  return (
    <div className="p-2">
      <BfLogotype />
      <Text.Heading>Create an account</Text.Heading>
      <TextInput className="w-full" />
      <Button className="w-full">Create Account</Button>
    </div>
  );
};
