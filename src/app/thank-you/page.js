import ThankYouPage from "@/components/thankyou/ThankYouPage";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  return <ThankYouPage orderNumber={params.order} />;
}
