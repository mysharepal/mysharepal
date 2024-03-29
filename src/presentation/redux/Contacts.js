import { actionCreator } from './util/Util'

import { getContacts, addContact, updateContact } from '../../core/contacts/ContactsInteractor'

function contactsReducer(state = {
    status: ContactsStatus.NOT_READY,
    data: null,
    error: null
}, action) {
    if (!isContactsAction(action)) {
        return state
    }

    const newState = { ...state, status: action.type, error: null }

    switch (action.type) {
        case ContactsStatus.NONE:
        case ContactsStatus.READY:
        case ContactsStatus.ADDED:
        case ContactsStatus.UPDATED:
            newState['data'] = action.payload
            break
        case ContactsStatus.ERROR:
        case ContactsStatus.ADD_ERROR:
            newState['error'] = action.payload
            break
    }

    return newState
}

function isContactsAction(action) {
    if (action && action.type) {
        return action.type.startsWith('contacts/')
    }

    return false
}

class ContactsStatus {
    static NOT_READY = 'contacts/not_ready'
    static GETTING = 'contacts/getting'
    static READY = 'contacts/ready'
    static NONE = 'contacts/none'

    static ADDING = 'contacts/adding'
    static ADDED = 'contacts/added'

    static UPDATING = 'contacts/updating'
    static UPDATED = 'contacts/updated'

    static ERROR = 'contacts/error'

    static ADD_ERROR = 'contacts/error/add'
}

class ContactsActions {
    static fetch = (uid) => {
        return (dispatch, getState) => {
            console.log('Getting for ' + uid)

            dispatch(InternalActions.getting())

            getContacts(uid)
                .then(contacts => {
                    if (contacts && contacts.length && contacts.length > 0) {
                        dispatch(InternalActions.ready(contacts))
                    } else {
                        dispatch(InternalActions.none())
                    }
                })
                .catch(error => dispatch(InternalActions.error(error)))
        }
    }

    static addContact = (uid, name, phone) => {
        console.log('Adding contact:')
        console.log(uid)
        console.log(name)
        console.log(phone)

        return (dispatch, getState) => {
            dispatch(InternalActions.adding())

            addContact(uid, name, phone)
                .then(newContacts => {
                    dispatch(InternalActions.added(newContacts))

                    // Only keep "added" status once--go back to ready once consumed
                    dispatch(InternalActions.ready(newContacts))
                })
                .catch(error => dispatch(InternalActions.addError(error)))
        }
    }
    
    static updateContact = (uid, contact) => {
        console.log('Updating contact:')
        console.log(uid)
        console.log(contact)


        return (dispatch, getState) => {
            dispatch(InternalActions.updating())

            updateContact(uid, contact)
                .then(newContacts => dispatch(InternalActions.updated(newContacts)))
                .catch(error => dispatch(InternalActions.error(error)))
        }
    }
}

class InternalActions {
    static getting = () => actionCreator(ContactsStatus.GETTING)
    static ready = contacts => actionCreator(ContactsStatus.READY, contacts)
    static none = () => actionCreator(ContactsStatus.NONE, [])

    static adding = () => actionCreator(ContactsStatus.ADDING)
    static added = newContacts => actionCreator(ContactsStatus.ADDED, newContacts)

    static updating = () => actionCreator(ContactsStatus.UPDATING)
    static updated = newContacts => actionCreator(ContactsStatus.UPDATED, newContacts)

    static error = error => actionCreator(ContactsStatus.ERROR, error)
    static addError = error => actionCreator(ContactsStatus.ADD_ERROR, error)
}

export { contactsReducer, ContactsStatus, ContactsActions }