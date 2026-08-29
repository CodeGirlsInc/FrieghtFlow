import { test, expect } from '@playwright/test';

const apiBaseUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:6006/api/v1';
const shipper = {
  email: process.env.E2E_SHIPPER_EMAIL,
  password: process.env.E2E_SHIPPER_PASSWORD,
};
const carrier = {
  email: process.env.E2E_CARRIER_EMAIL,
  password: process.env.E2E_CARRIER_PASSWORD,
};

test.describe('shipment lifecycle', () => {
  test.skip(
    !shipper.email || !shipper.password || !carrier.email || !carrier.password,
    'Set E2E_SHIPPER_EMAIL, E2E_SHIPPER_PASSWORD, E2E_CARRIER_EMAIL, and E2E_CARRIER_PASSWORD',
  );

  test('shipper creates, carrier accepts and delivers, shipper completes', async ({ page, request }) => {
    const login = async (credentials: typeof shipper) => {
      const response = await request.post(`${apiBaseUrl}/auth/login`, { data: credentials });
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      return body.accessToken as string;
    };

    const shipperToken = await login(shipper);
    const createResponse = await request.post(`${apiBaseUrl}/shipments`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
      data: {
        origin: 'Chicago, IL',
        destination: 'Atlanta, GA',
        cargoDescription: 'E2E lifecycle test cargo',
        weightKg: 100,
        price: 1500,
        currency: 'USD',
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const shipment = await createResponse.json();

    const carrierToken = await login(carrier);
    const carrierHeaders = { Authorization: `Bearer ${carrierToken}` };
    expect((await request.patch(`${apiBaseUrl}/shipments/${shipment.id}/accept`, { headers: carrierHeaders })).ok()).toBeTruthy();
    expect((await request.patch(`${apiBaseUrl}/shipments/${shipment.id}/pickup`, { headers: carrierHeaders })).ok()).toBeTruthy();
    expect((await request.patch(`${apiBaseUrl}/shipments/${shipment.id}/deliver`, { headers: carrierHeaders })).ok()).toBeTruthy();

    await page.context().addCookies([
      {
        name: 'auth_token',
        value: shipperToken,
        url: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000',
      },
    ]);
    const completion = await request.patch(`${apiBaseUrl}/shipments/${shipment.id}/confirm-delivery`, {
      headers: { Authorization: `Bearer ${shipperToken}` },
    });
    expect(completion.ok()).toBeTruthy();

    await page.goto(`/shipments/${shipment.id}`);
    await expect(page.getByText(/completed/i).first()).toBeVisible();
  });
});
