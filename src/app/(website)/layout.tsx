import { FaRegUser } from "react-icons/fa";
import { LuSparkles } from "react-icons/lu";

export default function WebsiteLayout({ children }: { readonly children: React.ReactNode }) {
    return (
        <>
            <header className="flex items-center justify-between py-2 px-4 bg-white border-b-1 border-orange-100">
                <div className="flex items-center text-lg font-bold">
                    <div className="bg-gradient-to-bl from-orange-500 to-yellow-500 text-white p-2 rounded-full">
                        <LuSparkles />
                    </div>
                    <span className="ml-2 text-gray-900/80 font-serif">ShantyMCP</span>
                </div>
                
                <button className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 p-2 rounded-2xl">
                    <FaRegUser className="text-gray-600"/>
                    <span className="ml-2 text-gray-900/80">User</span>
                </button>
            </header>
            <main className="">
                {children}
            </main>
        </>
        
    );
}