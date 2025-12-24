import React from 'react'
import { useLayout } from '../../Layout/useLayout';

function Customerdash() {

  const { LayoutComponent, role } = useLayout();
  
  return (
    <LayoutComponent>
      <div>customerdash</div>
    </LayoutComponent>
  );
}

export default Customerdash