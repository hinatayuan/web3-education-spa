import { useRoutes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@connections/wagmi';
import routes from '@routes/index';
import './index.css';
import './App.css';

const queryClient = new QueryClient();

const App = () => {
  const routing = useRoutes(routes);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{routing}</QueryClientProvider>
    </WagmiProvider>
  );
};
export default App;
