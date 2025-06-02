export async function up(db) {
  const gyms = await db.collection('gyms').find({}).toArray();

  for (const gym of gyms) {
    const currentAddress = gym.address;
    const updateDoc = {
      addressLine1: null,
      addressLine2: null,
      city: null,
      region: null,
      postalCode: null,
      country: 'PA',
    };

    // If current address exists and is a string (old format)
    if (typeof currentAddress === 'string') {
      updateDoc.addressLine1 = currentAddress;
    }
    // If current address is an object, preserve existing values
    else if (currentAddress && typeof currentAddress === 'object') {
      updateDoc.addressLine1 = currentAddress.addressLine1 || null;
      updateDoc.addressLine2 = currentAddress.addressLine2 || null;
      updateDoc.city = currentAddress.city || null;
      updateDoc.region = currentAddress.region || null;
      updateDoc.postalCode = currentAddress.postalCode || null;
      // Always set country to US as required
      updateDoc.country = 'PA';
    }

    console.log(
      `Updating gym ${gym._id}: ${JSON.stringify(currentAddress)} -> ${JSON.stringify(updateDoc)}`
    );

    // Update one document at a time
    await db.collection('gyms').updateOne({ _id: gym._id }, { $set: { address: updateDoc } });
  }
}

export async function down(db) {
  const gyms = await db.collection('gyms').find({}).toArray();

  for (const gym of gyms) {
    const currentAddress = gym.address;

    // Log the reversion
    console.log(`Reverting gym ${gym._id} address: ${JSON.stringify(currentAddress)} -> null`);

    await db.collection('gyms').updateOne({ _id: gym._id }, { $set: { address: null } });
  }
}
