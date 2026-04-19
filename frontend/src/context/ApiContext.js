import { createContext, useContext } from 'react';

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const baseURL = 'http://localhost:5001/api';
    
    return (
        <ApiContext.Provider value={{ baseURL }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}; 