import { createFileRoute } from "@tanstack/react-router";

export const AboutPage = () => {
  return (
    <div className="p-2">
      <h3>Welcome Bonfire About!</h3>
    </div>
  );
};

export const Route = createFileRoute("/about")({
  component: AboutPage,
});
