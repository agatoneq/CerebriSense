"""Add processed_files table and adjust patients

Revision ID: 055987a4c3be
Revises: 495e2a1a076a
Create Date: 2025-01-09 14:46:31.652956

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '055987a4c3be'
down_revision = '495e2a1a076a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('processed_files',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('patient_id', sa.Integer(), nullable=False),
    sa.Column('file_path', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('patients', schema=None) as batch_op:
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), nullable=True))
        batch_op.alter_column('doctor_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.drop_column('processed_eeg_file')
        batch_op.drop_column('raw_eeg_file')
        batch_op.drop_column('model_result')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('patients', schema=None) as batch_op:
        batch_op.add_column(sa.Column('model_result', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('raw_eeg_file', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('processed_eeg_file', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
        batch_op.alter_column('doctor_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.drop_column('created_at')

    op.drop_table('processed_files')
    # ### end Alembic commands ###
