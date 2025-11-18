import React from 'react';
import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui'; 

const LABELS = {
    'change-wallet': 'Change wallet',
    connecting: 'Connecting ...',
    'copy-address': 'Copy address',
    copied: 'Copied',
    disconnect: 'Disconnect',
    'has-wallet': 'Connect',
    'no-wallet':  'Get Started',
} as const;

require("./wallet.css");

const ConnectWallet = () => {
  return (
    <BaseWalletMultiButton labels={LABELS} />  
  );
};

export default ConnectWallet;
