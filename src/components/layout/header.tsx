import Link from "next/link";
import { NameTransition } from "../name";

// Header component
const Header = () => (
  <header className="mb-6 max-w-4xl mx-auto px-4 pt-12 sm:px-8 sm:mb-8 flex justify-between items-center">
    <div>
      <NameTransition />
      <div className="flex space-x-4 mt-3 text-sm text-gray-600">
        <span>Writer</span>
      </div>
    </div>
    <Link href="https://x.com/" className="no-underline text-2xl">
      𝕏
    </Link>
  </header>
);

export default Header;
