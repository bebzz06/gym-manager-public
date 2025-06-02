export async function up(db) {
  // Remove membershipStatus and membershipType fields from all users
  await db.collection('users').updateMany(
    {},
    {
      $unset: {
        membershipStatus: '',
        membershipType: '',
      },
    }
  );
}

export async function down(db) {
  // Restore the fields with their default values if needed to rollback
  await db.collection('users').updateMany(
    {},
    {
      $set: {
        membershipStatus: 'PENDING', // Default value from your schema
        membershipType: 'NONE', // Default value from your schema
      },
    }
  );
}
