from django.core.management.base import BaseCommand
from evaluations.models import Answer

class Command(BaseCommand):
    help = 'Deletes answers that are not associated with any quiz attempt.'

    def handle(self, *args, **options):
        orphaned_answers = Answer.objects.filter(attempt__isnull=True)
        count = orphaned_answers.count()
        orphaned_answers.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} orphaned answers.'))
