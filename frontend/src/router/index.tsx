import { createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { appRouteElements } from './app-routes';

export const appRouter = createBrowserRouter(createRoutesFromElements(appRouteElements));
