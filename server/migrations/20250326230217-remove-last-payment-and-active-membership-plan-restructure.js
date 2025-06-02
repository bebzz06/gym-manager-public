export async function up(db) {
  // First, remove the old fields
  await db.collection('users').updateMany(
    {},
    {
      $unset: {
        lastPayment: '',
        activeMembershipPlan: '',
      },
    }
  );

  // Then, add the new activeMembershipPlan structure
  await db.collection('users').updateMany(
    {},
    {
      $set: {
        activeMembershipPlan: {
          isActive: false,
          plan: null,
          payment: null,
        },
      },
    }
  );
}

export async function down(db) {
  // Revert the changes by removing the new structure
  await db.collection('users').updateMany(
    {},
    {
      $unset: {
        activeMembershipPlan: '',
      },
    }
  );

  // Restore the original fields with null values
  await db.collection('users').updateMany(
    {},
    {
      $set: {
        lastPayment: null,
        activeMembershipPlan: null,
      },
    }
  );
}
