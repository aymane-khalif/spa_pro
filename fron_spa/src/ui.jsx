import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
export function Link({ href, ...props }) { return <RouterLink to={href} {...props}/>; }
export function Head({ title }) { useEffect(() => { document.title = title; }, [title]); return null; }
