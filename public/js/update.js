const storeForm = document.getElementById('store-form');
const storeId = document.getElementById('store-id');
const storeAddress = document.getElementById('store-address');
const newStoreId = document.getElementById('new-store-id');
const newStoreDescription = document.getElementById('new-store-description');

// Send POST to API to add store
async function updateStore(e) {
  e.preventDefault();

  if (storeId.value === '' || storeAddress.value === '' || newStoreDescription === '' || newStoreId === "" ) {
    alert('Please fill in fields');
  }

  const sendBody = {
    storeId: storeId.value,
    address: storeAddress.value,
    newStoreId: newStoreId.value,
    newStoreDescription: newStoreDescription.value
  };

  try {
    const res = await fetch('/api/v1/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendBody)
    });

    if (res.status === 400) {
      throw Error('Store already exists!');
    }

    alert('Place updated!');
    window.location.href = '/index.html';
  } catch (err) {
    alert(err);
    return;
  }
}

storeForm.addEventListener('submit', updateStore);
