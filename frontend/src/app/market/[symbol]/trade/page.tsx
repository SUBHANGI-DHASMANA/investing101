import ClientTradePage from './client-page';

type Props = {
  params: { symbol: string }
}

// Use an async function for the page component to handle dynamic params
export default async function TradePage(props: Props) {
  // Extract the symbol from params
  const symbol = props.params.symbol || '';

  // Pass the symbol directly to the client component
  return <ClientTradePage symbol={symbol} />;
}
