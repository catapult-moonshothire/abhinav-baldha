import { Edit, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => (
  <div
    className={cn(
      "fixed inset-y-0 left-0 z-50 w-48 transform bg-background transition-transform duration-200 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "md:relative md:translate-x-0"
    )}
  >
    <div className="flex h-full flex-col p-4 pl-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="space-y-2">
        <Button variant="default" className="w-full justify-start">
          <Edit className="mr-2 h-4 w-4" />
          Posts
        </Button>
      </nav>
    </div>
  </div>
);

export default Sidebar;
