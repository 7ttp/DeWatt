import { Metadata } from "next";
import { Poppins } from "next/font/google"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletContextProvider from '@/contexts/WalletProvider';
import SupportBubble from '@/components/SupportBubble/SupportBubble';
import './globals.css';

export const metadata: Metadata = {
  title: "DeWatt | The distributed charging network",
  description: "Charge your car or sell your exceeding energy in the most blockchain way possible!",
  icons: {
    icon: '/dewatt_logo_transparent.png',
    apple: '/dewatt_logo_transparent.png',
  },
  openGraph: {
    images: "https://www.dewatt.xyz/ogimage.png",
    type: "website",
    url: "https://www.dewatt.xyz",
    locale: "en",
  }
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700",],
  display: "swap",
  style: ["italic", "normal"],
  subsets: ["latin"],
})

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <html  lang="en" className={poppins.className}>
        <body>
            <WalletContextProvider>
              {children}
              <ToastContainer theme="dark" bodyClassName={"font-medium"}/>
              <SupportBubble />
            </WalletContextProvider>
        </body>
    </html>
  );
};

export default App;
