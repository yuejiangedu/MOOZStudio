import PubSub from "pubsub-js";

export function useSubscribe() {
  return PubSub.subscribe;
}
export function usePublish() {
  return PubSub.publish;
}
export function useUnsubscribe() {
  return PubSub.unsubscribe;
}
