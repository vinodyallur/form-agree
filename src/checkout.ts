import { demo } from "demo-pay";

export async function quickCheckout(email: string, cardToken: string) {
  await demo.customers.create({ email });

  // Second affected call site for charges.create
  const charge = await demo.charges.create({
    c2: 4999,
    currency: "usd",
    source: cardToken,
  });

  return charge.id;
}

// A red herring: a local object that happens to have a `charges.create` shape
const fakeApi = {
  charges: {
    create: (x: unknown) => x,
  },
};
export function notAffected() {
  const source = "local-var";
  return fakeApi.charges.create({ source });
}
