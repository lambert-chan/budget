import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material'

export default function StatCard({ label, value, sub, icon, color = 'primary.main', loading }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontSize={11}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={120} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={600} color={color} sx={{ mt: 0.5 }}>
                {value}
              </Typography>
            )}
            {sub && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {sub}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box sx={{
              p: 1.25, borderRadius: 2,
              bgcolor: color === 'error.main' ? 'error.lighter' : 'primary.lighter',
              color,
              display: 'flex', alignItems: 'center',
              bgcolor: `${color.split('.')[0]}.main`,
              opacity: 0.12,
            }} />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
