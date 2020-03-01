import React from 'react';
import { withTracker, useTracker } from 'meteor/react-meteor-data';
import { UserAccountTypes } from '/imports/api/collections/UserAccountCollection';
import { UserAccount } from '../../../../client/lib/client_collections'

// type UserAccountScreenTypes = {props: any,userAccount: UserAccountTypes}
const UserAccountScreen: React.FC = (props, userAccount: UserAccountTypes): JSX.Element => {

  // const userAccount = useTracker<UserAccountTypes>(() => { UserAccount.findOne()}, [])
  // const 
  return (
    <h5>User Account: {userAccount.address}</h5>
  )
}

// export default UserAccountScreen
export default withTracker((props) => {
  return {
    userAccount: UserAccount.findOne(),
  };
})(UserAccountScreen);

