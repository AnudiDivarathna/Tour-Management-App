function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function splitDriverHelper(data) {
  let driverPayment = num(data.driverPayment);
  let helperPayment = num(data.helperPayment);
  const legacy = num(data.driverHelperPayment);

  // Older tours stored a single combined amount.
  if (driverPayment === 0 && helperPayment === 0 && legacy !== 0) {
    driverPayment = legacy;
  }

  return { driverPayment, helperPayment };
}

export function calculateTourFinance(data) {
  const dieselCost = num(data.dieselCost);
  const { driverPayment, helperPayment } = splitDriverHelper(data);
  const foodBill = num(data.foodBill);
  const waterBottles = num(data.waterBottles);
  const accommodationCharges = num(data.accommodationCharges);
  const highwayBill = num(data.highwayBill);
  const parkingBill = num(data.parkingBill);
  const fuelAdvance = num(data.fuelAdvance);
  const balance = num(data.balance);
  const commission = num(data.commission);

  const totalCost =
    dieselCost +
    driverPayment +
    helperPayment +
    foodBill +
    waterBottles +
    accommodationCharges +
    highwayBill +
    parkingBill;

  const netProfit = fuelAdvance + balance + commission - totalCost;

  return { totalCost, netProfit };
}
