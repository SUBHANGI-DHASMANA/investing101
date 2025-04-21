import ClientStockDetail from './client-page';

type Props = {
  params: { symbol: string }
}

// Use an async function for the page component to handle dynamic params
export default async function StockDetail(props: Props) {
  // Extract the symbol from params
  const symbol = props.params.symbol || '';

  // Pass the symbol directly to the client component
  return <ClientStockDetail symbol={symbol} />;
}
