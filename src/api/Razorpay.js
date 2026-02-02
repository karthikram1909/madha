export const initiatePayment = async (paymentData) => {
  try {
    const response = await fetch("https://secure.madhatv.in/api/v2/payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!data.status) {
      // Log the error for debugging
      console.error("Error initiating payment: ", data);
      throw new Error("Failed to initiate payment");
    }
    return data;
  } catch (error) {
    console.error("Payment initiation failed:", error);
    throw error; // Re-throw the error after logging
  }
};

export const createRazorpayOrder = async (paymentId, amount, currency) => {
  try {
    const response = await fetch("https://secure.madhatv.in/api/v2/razorpay/create_order.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: Math.round(amount * 100),
        currency: currency,
      }),
    });

    const data = await response.json();
    if (!data.status) {
      // Log the error for debugging
      console.error("Error creating Razorpay order: ", data);
      throw new Error("Failed to create Razorpay order");
    }
    return data;
  } catch (error) {
    console.error("Error while creating Razorpay order:", error);
    throw error;
  }
};

export const verifyPaymentCallback = async (paymentData) => {
  try {
    const response = await fetch("https://secure.madhatv.in/api/v2/payment_callback.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (!data.status) {
      // Log the error for debugging
      console.error("Error verifying payment: ", data);
      throw new Error("Payment verification failed");
    }
    return data;
  } catch (error) {
    console.error("Error during payment verification callback:", error);
    throw error;
  }
};
