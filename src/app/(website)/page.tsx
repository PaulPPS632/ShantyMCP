"use client"
import { Tab, Tabs, Pagination, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { GoGear } from "react-icons/go";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlineStorefront } from "react-icons/md";
import ChatComponent from "./components/ChatComponent";

function Page() {
    const [tab, setTab] = useState("chat");
    return (
      <section>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key))}
          aria-label="Opciones"
          variant="solid"
          color="primary"
          classNames={{
              tabList: "gap-2 w-fit relative rounded-xl p-1 border border-orange-300 bg-orange-200",
              cursor: "bg-orange-400",
              tab: "max-w-fit py-1 px-2 bg-orange-300 rounded-xl hover:bg-orange-400 transition-colors",
              tabContent: "group-data-[selected=true]:text-white text-white",
          }}
        >
            <Tab key="chat" title={<div className="flex items-center space-x-2"><IoChatbubbleOutline /><span className="text-xs">Chat</span></div>} />
            <Tab key="tienda" title={<div className="flex items-center space-x-2"><MdOutlineStorefront /><span className="text-xs">Tienda</span></div>} />
            <Tab key="configuracion" title={<div className="flex items-center space-x-2"><GoGear /><span className="text-xs">Configuracion</span></div>} />
        </Tabs>
        <span className="text-black">{tab}</span>
        {tab === "chat" && <ChatComponent />}
        {/* {tab === "tienda" && <StoreComponent />}
        {tab === "configuracion" && <SettingsComponent />} */}
      </section>
    );
}
export default Page;