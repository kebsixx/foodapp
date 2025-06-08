import { Stack } from "expo-router";
import { useOrderUpdateSubscription } from "../../../api/subscription";

export default function OrdersLayout() {
  useOrderUpdateSubscription();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
