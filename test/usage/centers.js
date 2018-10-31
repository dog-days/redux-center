export async function incrementAsync(action, { put, delay }) {
  switch (action.type) {
    case 'INCREMENT_ASYNC':
      await delay(1000);
      await put({ type: 'INCREMENT' });
      break;
    default:
  }
}
