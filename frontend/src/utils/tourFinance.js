function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function calculateTourFinance(data) {
  const dieselCost = num(data.dieselCost);
  const driverHelperPayment = num(data.driverHelperPayment);
  const foodBill = num(data.foodBill);
  const accommodationCharges = num(data.accommodationCharges);
  const highwayBill = num(data.highwayBill);
  const parkingBill = num(data.parkingBill);
  const fuelAdvance = num(data.fuelAdvance);
  const balance = num(data.balance);
  const commission = num(data.commission);

  const totalCost =
    dieselCost +
    driverHelperPayment +
    foodBill +
    accommodationCharges +
    highwayBill +
    parkingBill;

  const netProfit = fuelAdvance + balance + commission - totalCost;

  return { totalCost, netProfit };
}
