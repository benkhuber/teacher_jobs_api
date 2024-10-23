import { useState } from "react";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a className="text-white text-2xl font-bold" href="/">
          Teacher Jobs
        </a>

        <div className="hidden md:flex space-x-6 text-white">
          <a className="hover:text-gray-300" href="/">Home</a>
          <a className="hover:text-gray-300" href="/about">About</a>
          <a className="hover:text-gray-300" href="/alljobs">All Current Jobs</a>
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 space-y-2 text-white">
          <a className="block hover:bg-blue-700 p-2" href="/">Home</a>
          <a className="block hover:bg-blue-700 p-2" href="/about">About</a>
          <a className="block hover:bg-blue-700 p-2" href="/alljobs">All Current Jobs</a>
        </div>
      )}
    </header>
  );
}

export default NavBar;
