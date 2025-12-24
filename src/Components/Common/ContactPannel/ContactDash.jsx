import React from 'react'
import { useLayout } from '../../Layout/useLayout';

function ContactDash() {

      const { LayoutComponent, role } = useLayout();
  return (
    <LayoutComponent>
      <div>ContactDash</div>
    </LayoutComponent>
  );
}

export default ContactDash