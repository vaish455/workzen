import { memo } from 'react'

/**
 * WorkZen Table Component - Odoo-Inspired Design
 * Clean, modern table with proper spacing and borders
 * 
 * @example
 * // Basic table
 * <Table>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.Head>Name</Table.Head>
 *       <Table.Head>Email</Table.Head>
 *       <Table.Head>Status</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Row>
 *       <Table.Cell>John Doe</Table.Cell>
 *       <Table.Cell>john@example.com</Table.Cell>
 *       <Table.Cell>Active</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * 
 * @example
 * // Hoverable table rows
 * <Table hoverable>
 *   <Table.Body>
 *     <Table.Row onClick={handleRowClick}>
 *       <Table.Cell>Data</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * 
 * Key Features:
 * - Clean borders and spacing
 * - Optional hover effects on rows
 * - Responsive design
 * - Modular components
 * - Accessible
 */
const Table = memo(({ 
  children, 
  hoverable = false,
  className = '',
  style = {},
  ...props 
}) => {
  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    ...style,
  }

  return (
    <div 
      className={`table-wrapper ${className}`}
      style={{ 
        overflowX: 'auto',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <table 
        style={tableStyles} 
        data-hoverable={hoverable}
        {...props}
      >
        {children}
      </table>
    </div>
  )
})

Table.displayName = 'Table'

// Table Header Component
const TableHeader = memo(({ children, className = '', style = {}, ...props }) => {
  const headerStyles = {
    backgroundColor: 'var(--color-secondary)',
    ...style,
  }

  return (
    <thead className={`table-header ${className}`} style={headerStyles} {...props}>
      {children}
    </thead>
  )
})

TableHeader.displayName = 'Table.Header'

// Table Body Component
const TableBody = memo(({ children, className = '', style = {}, ...props }) => {
  return (
    <tbody className={`table-body ${className}`} style={style} {...props}>
      {children}
    </tbody>
  )
})

TableBody.displayName = 'Table.Body'

// Table Row Component
const TableRow = memo(({ children, onClick, className = '', style = {}, ...props }) => {
  const rowStyles = {
    borderBottom: '1px solid var(--color-border)',
    transition: 'background-color var(--transition-fast)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  const handleMouseEnter = (e) => {
    const table = e.currentTarget.closest('table')
    if (table?.dataset?.hoverable === 'true' || onClick) {
      e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'
    }
  }

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent'
  }

  return (
    <tr
      className={`table-row ${className}`}
      style={rowStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </tr>
  )
})

TableRow.displayName = 'Table.Row'

// Table Head Component (for header cells)
const TableHead = memo(({ children, className = '', style = {}, align = 'left', ...props }) => {
  const headStyles = {
    padding: 'var(--space-4) var(--space-6)',
    textAlign: align,
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
    ...style,
  }

  return (
    <th className={`table-head ${className}`} style={headStyles} {...props}>
      {children}
    </th>
  )
})

TableHead.displayName = 'Table.Head'

// Table Cell Component
const TableCell = memo(({ children, className = '', style = {}, align = 'left', ...props }) => {
  const cellStyles = {
    padding: 'var(--space-4) var(--space-6)',
    textAlign: align,
    fontSize: 'var(--font-size-base)',
    color: 'var(--color-text-primary)',
    ...style,
  }

  return (
    <td className={`table-cell ${className}`} style={cellStyles} {...props}>
      {children}
    </td>
  )
})

TableCell.displayName = 'Table.Cell'

// Attach sub-components to Table
Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Head = TableHead
Table.Cell = TableCell

export default Table
