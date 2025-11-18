import React, { useState } from "react";
import Image from "next/image";
import bag from "./assets/bag.svg";
import cart from "./assets/cart.svg";
import dash from "./assets/dash.svg";

interface SidebarAppProps {
  setActivePage: (page: string) => void;
}

const SidebarApp: React.FC<SidebarAppProps> = ({ setActivePage }) => {
  const [activeIcon, setActiveIcon] = useState<number>(0);

  const handleIconClick = (index: number) => {
    setActiveIcon(index);
    switch (index) {
      case 0:
        setActivePage("dashboard");
        break;
      // O case 1 foi removido
      case 2:
        setActivePage("paginaTres");
        break;
      default:
        setActivePage("dashboard");
    }
  };

  return (
    <aside className="w-16 text-white flex flex-col items-center py-4 fixed left-0 top-0 bottom-0 h-screen ml-4 justify-center">
      <div
        className={`my-4 rounded-full p-2 h-16 w-16 flex justify-center items-center ${
          activeIcon === 0 ? "bg-[#3AFF4E]" : "bg-[#1d1d1d]"
        }`}
        onClick={() => handleIconClick(0)}
      >
        <Image
          src={dash}
          alt="Dashboard icon"
          width={32}
          height={32}
          style={{ filter: activeIcon === 0 ? "invert(1)" : "invert(0)" }}
        />
      </div>
      {/* O bloco para o case 1 (Pagina Dois) foi removido */}
      <div
        className={`my-4 rounded-full p-2 h-16 w-16 flex justify-center items-center ${
          activeIcon === 2 ? "bg-[#3AFF4E]" : "bg-[#1d1d1d]"
        }`}
        onClick={() => handleIconClick(2)}
      >
        <Image
          src={bag}
          alt="Pagina Tres icon"
          width={32}
          height={32}
          style={{ filter: activeIcon === 2 ? "invert(1)" : "invert(0)" }}
        />
      </div>
    </aside>
  );
};

export default SidebarApp;
