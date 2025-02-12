import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from '../state/store';
import { ProvideLocalStoreFsService } from '../state/fsService';
import { connect } from '../state/connectFsServiceAndStore';

export interface Wrapper {
    children: ReactNode
}

// Load and initilize - Redux Store and FsService Context
export const StateLoader: React.FC<Wrapper> = ({ children }) => {
    return <Provider store={store}>
        <ProvideLocalStoreFsService>
            <Initilization>
                {children}
            </Initilization>
        </ProvideLocalStoreFsService>
    </Provider>
}

const Initilization: React.FC<Wrapper> = ({ children }) => {
    connect()
    return <>
        {children}
    </>
}