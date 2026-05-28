import { Button, BfLogotype, Text, TextInput, Select } from "@/components";

export const HomePage = () => {
  return (
    <div className="p-2">
      <BfLogotype />
      <Text.Heading>Create an account</Text.Heading>
      <TextInput className="w-full" />
      <Select className="w-full">
        <option disabled selected>
          Pick a color
        </option>
        <option>Crimson</option>
        <option>Amber</option>
        <option>Velvet</option>
      </Select>
      <Button className="w-full">Create Account</Button>
    </div>
  );
};
